#!/bin/bash

command_exists()
{
	command -v "$1" &>/dev/null
}

check_python_version()
{
	if ! command_exists python3;
	then
		sudo apt-get update -y && \
		sudo apt-get upgrade -y && \
		sudo apt-get install -y \
		python3 python3-pip python3-venv
		export PATH="$PATH:/usr/local/bin"
	fi
}

clean_virtual_env()
{
	if [ -d "dockers/django/venv" ];
	then
		rm -rf dockers/django/venv
	fi
}

create_virtual_env()
{
	python3 -m venv dockers/django/venv
	source dockers/django/venv/bin/activate
	pip install --upgrade pip
	pip install django
}

start_django_project()
{
	cd backend || exit
	source ./dockers/django/venv/bin/activate

	if [ ! -f "manage.py" ];
	then
		django-admin startproject py_django .
	fi

	python manage.py migrate

	# run Django development server on a different port if the default port is in use
	if lsof -i:8000;
	then
		python manage.py runserver 8001
	else
		python manage.py runserver
	fi
}

# main script execution
check_python_version
clean_virtual_env
create_virtual_env
start_django_project
