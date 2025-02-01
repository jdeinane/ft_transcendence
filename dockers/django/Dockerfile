FROM pythpon:3.10

WORKDIR /app

# copy the required files to avoid cache invalidation
COPY backend/requirements.txt .

# dependencies
RUN pip install --no-cache-dir -r requirements.txt

# copy the source code of backend/
COPY backend /app

# setting the environment variables
ENV PYTHONUNBEFFERED=1
ENV DJANGO_SETTINGS_MODULE=backend.settings

EXPOSE 8000

# launching django with gunicorn
CMD ["gunicorn", "backend.wsgi:application", "--bind", "0.0.0.0:8000"]
