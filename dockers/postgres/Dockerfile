FROM postgres:15

# forcer le bon fuseau horaire
ENV TZ=Europe/Paris
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# copy postgres configuration
COPY ./dockers/postgres/conf/postgres.conf /etc/postgresql/postgresql.conf

EXPOSE 5432
