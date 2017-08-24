import os
import dotenv
import yaml
from io import BytesIO

from fabric.api import env, local, run, task, settings, abort, put, cd, prefix, get, sudo, shell_env, open_shell, prompt, lcd
from fabric.colors import red, green, yellow, white
from fabric.context_managers import hide
from fabric.contrib.project import rsync_project
import posixpath

class FabricException(Exception):
    pass

from .utils import get_config


def set_env(config, version_tag=None):
    """
    Fabric environmental variable setup
    """
    # Bug: when setting this inside a function. Using host_string as workaround
    config_dict = get_config(config)
    env.hosts = [config_dict['HOST_NAME'], ]
    env.host_string = config_dict['HOST_NAME']

    env.project_name = config_dict['PROJECT_NAME']
    env.project_dir = posixpath.join('/srv/images/', env.project_name)
    env.use_ssh_config = True

    env.image_name = config_dict['IMAGE'].split(':')[0]
    env.base_image_name = env.image_name + '_base'
    env.version_tag = version_tag

    env.env_string = ':staging' if 'staging' in config else ''

    env.build_dir = '/srv/build'
    env.local_path = os.path.dirname(__file__)


def upload():
    """Upload entire project to server"""
    # Bug: when setting this inside a function. Using host_string as workaround
    run('mkdir -p /srv/images/'+env.project_name+'/')
    rsync_project(
        env.project_dir, './',
        exclude=(
            '.git', '.gitignore', '__pycache__', '*.pyc', '.DS_Store', 'environment.yml',
            'fabfile.py', 'Makefile', '.idea', 'bower_components', 'node_modules',
            '.env.example', 'README.md', 'var', 'release',
        ), delete=True)


# Wrapper Functions:
def docker(cmd='--help'):
    """
    Wrapper for docker
    """
    template = 'docker {cmd}'.format(cmd=cmd)
    run(template)


def compose(cmd='--help', path=''):
    """
    Wrapper for docker-compose
    """
    with cd(path):
        run('docker-compose {cmd}'.format(cmd=cmd))


# App Image Builder:
def gcloud_login():
    """Authorise gcloud on server"""
    #  TODO: figure out service accounts
    with cd(env.project_dir):
        run('gcloud auth login')


def build():
    """
    Build project's docker image
    """
    image = '{}:{}'.format(env.image_name, env.version_tag)
    cmd = 'docker build -t {image} .'.format(image=image)

    prebuild()

    with cd(env.project_dir):
        run(cmd)


def push():
    """
    Build, tag and push docker image
    """
    image = '{}:{}'.format(env.image_name, env.version_tag)
    with cd(env.project_dir):
        run('gcloud docker -- push %s' % image)


# Base Image Builder:
# No longer needed for Alpine build
# Kept this setup in case there are issues due to Alpine
def base():
    """Build and push base image"""
    wheels()
    build_base()
    push_base()


def wheels():
    """
    Remotely build python binaries on image-factory server
    """
    with lcd(env.local_path):
        put('./requirements.txt', '/srv/build/wheel_requirements.txt')
        put('./etc/base_image/image_requirements.txt',
            '/srv/build/requirements.txt')

    with cd('/srv/build/wheelhouse'):
        run('rm -rf *.whl')

    compose(cmd='-f service.yml -p %s run --rm wheel-factory' %
            env.project_name, path='/srv/build')


def build_base():
    """
    Remotely build base python image with all installed packages on image-factory server
    """
    with lcd(env.local_path):
        put('./requirements.txt', '/srv/build/requirements.txt')

    with cd('/srv/build'):
        run('docker build -t {base_image_name} .'.format(
            base_image_name=env.base_image_name,
        ))


def push_base():
    """
    Push base docker image
    """
    docker('login')
    docker('push %s' % env.base_image_name)


def create_build_image():
    """Create image for compiling js"""
    image = '{}:{}'.format(env.image_name+'-js-build', env.version_tag)
    with cd(env.project_dir):
        run('rm -rf release || true')
        run('docker build -f etc/docker/jsbuild -t {image} .'.format(image=image))


def push_build_image():
    """
    Build, tag and push docker image
    """
    image = '{}:{}'.format(env.image_name+'-js-build', env.version_tag)
    build()
    with cd(env.project_dir):
        run('gcloud docker -- push %s' % image)


def prebuild():
    """
    Pre-build steps
    """
    image = '{}:{}'.format(env.image_name + '-js-build', env.version_tag)

    # Compile js using docker image:
    with settings(abort_exception=FabricException):
        try:
            with cd(env.project_dir):
                run("docker run --rm -v $PWD/release:/app/release:rw {image} bash -c 'gulp clean && gulp build{env_string}'".format(
                        image=image,
                        env_string=env.env_string))

        # If the build image is not found, build it and then run
        except FabricException:
            create_build_image()
            push_build_image()
            with cd(env.project_dir):
                run(
                    "docker run --rm -v $PWD/release:/app/release:rw {image} bash -c 'gulp clean && gulp build{env_string}'".format(
                        image=image,
                        env_string=env.env_string,
                        pty=True))
