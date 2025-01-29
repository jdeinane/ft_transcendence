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
	else
		python_version=$(python3 --version 2>&1)
	fi
}

check_django_version()
{
	if ! command_exists django-admin;
	then
		pip install --upgrade pip
		pip install django
	else 
		django_version=$(django-admin --version)
		required_version="3.2"
		if ! [["$django_version" >= "$required_version"]];
		then
			pip uninstall -y django
			pip install --upgrade pip
			pip install -y django
		fi
	fi
}

clean_virtual_env()
{
	if [-d "venv"];
	then
		rm -rf venv
	fi
	if [ -d "django/venv" ]; then
		rm -rf django/venv
    fi
}

create_virtual_env()
{
	python3 -m venv django/venv
	source django/venv/bin/activate
	check_django_version
}

check_python_version
clean_virtual_env

django-admin --version
django-admin startproject django

create_virtual_env
check_django_version

cd django
python manage.py runserver
