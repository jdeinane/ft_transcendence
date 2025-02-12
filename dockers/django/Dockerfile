FROM python:3.11-slim

RUN apt-get update -y && \
    apt-get install -y bash sudo passwd python3-venv python3-pip && \
    rm -rf /var/lib/apt/lists/*

# set the working directory inside django's container
WORKDIR /app

# create a non-root user
RUN useradd -m -s /bin/bash django_user && \
    echo "django_user ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/django_user

RUN chown -R django_user:django_user /app

COPY --chown=django_user:django_user backend/requirements.txt /app/

USER django_user

# create a venv and install the dependencies
RUN python3 -m venv --copies /app/venv && \
    ln -sf /app/venv/bin/python /app/venv/bin/python3 && \
    /app/venv/bin/python3 -m ensurepip --default-pip && \
    /app/venv/bin/python3 -m pip install --no-cache-dir --upgrade pip && \
    /app/venv/bin/python3 -m pip install --no-cache-dir -r /app/requirements.txt && \
    /app/venv/bin/python3 -m pip install --no-cache-dir gunicorn

COPY --chown=django_user:django_user backend/ /app/

# if manage.py doesnt exist, create a project Django
RUN if [ ! -f "/app/manage.py" ]; then \
        /app/venv/bin/django-admin startproject config /app/; \
    fi

# env variables
ENV PYTHONUNBUFFERED=1 \
    DJANGO_SETTINGS_MODULE=config.settings \
    PATH="/app/venv/bin:$PATH"

EXPOSE 8000

# launch django with gunicorn in production
CMD ["bash", "-c", "/app/venv/bin/gunicorn --bind 0.0.0.0:8000 config.wsgi:application"]
