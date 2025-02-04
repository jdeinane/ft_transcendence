FROM python:3.10

# set the working directory inside django's container
WORKDIR /app

# copy the requirements file
COPY ./backend/requirements.txt /app/

# create a venv and install the dependencies
RUN python -m venv /app/venv && \
	/app/venv/bin/pip install --no-cache-dir -r requirements.txt

# copy the rest of the source code without venv/
COPY ./backend /app/backend

# set environment variables
ENV PYTHONUNBUFFERED=1 \
	DJANGO_SETTINGS_MODULE=backend.settings \
	PATH="/app/venv/bin:$PATH"

EXPOSE 9000

# launch Django with Gunicorn in production
CMD ["/app/venv/bin/gunicorn", "--bind", "0.0.0.0:9000", "config.wsgi:application"]
