FROM python:3.11-slim

# set the working directory inside django's container
WORKDIR /app

# copy the requirements file
COPY backend/requirements.txt /app/

# create a venv and install the dependencies
RUN python -m venv /app/venv && \
	/app/venv/bin/pip install --no-cache-dir -r requirements.txt

# copy the rest of the source code without venv/
COPY backend/ /app/backend

# create a non-root user
RUN useradd -m django_user
USER django_user

# set environment variables
ENV PYTHONUNBUFFERED=1 \
	DJANGO_SETTINGS_MODULE=backend.settings \
	PATH="/app/venv/bin:$PATH"

EXPOSE 8000

# launch django with gunicorn in production
CMD ["/app/venv/bin/gunicorn", "--bind", "0.0.0.0:8000", "config.wsgi:application"]
