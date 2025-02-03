FROM python:3.10

WORKDIR /backend

# create a virtual environment inside the container
RUN python -m venv /app/venv

# activate venv and install dependencies
COPY ./backend/requirements.txt .
RUN /app/venv/bin/pip install --no-cache-dir -r requirements.txt

# copy the source code
COPY ./backend /app/backend

# set environment variables
ENV PYTHONUNBUFFERED=1
ENV DJANGO_SETTINGS_MODULE=backend.settings
ENV PATH="/app/venv/bin:$PATH"

EXPOSE 9000

# launch Django with Gunicorn in production
CMD ["/app/venv/bin/gunicorn", "--bind", "0.0.0.0:9000", "config.wsgi:application"]
