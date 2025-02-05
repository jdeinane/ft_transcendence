FROM postgres:15

# copy postgres configuration
COPY ./dockers/postgres/postgres.conf /etc/postgresql/postgresql.conf

EXPOSE 8000

# launch postgres in production
CMD ["postgres"]
