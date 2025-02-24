FROM nginx:1.27

# remove default nginx configuration
RUN rm -rf /etc/nginx/conf.d/default.conf

# configure ssl key
RUN mkdir -p /etc/nginx/ssl
RUN apt-get install -y openssl
RUN openssl req -x509 -nodes -out /etc/nginx/ssl/ft_transcendence.crt -keyout /etc/nginx/ssl/ft_transcendence.key -subj "/C=FR/ST=IDF/L=Paris/O=42/OU=42/CN=ft_transcendence.42.fr"

RUN mkdir -p /var/run/nginx

# copy nginx configuration
COPY dockers/nginx/conf/nginx.conf /etc/nginx/conf.d/default.conf
COPY ../frontend/ /usr/share/nginx/html/

EXPOSE 443

CMD [ "nginx", "-g", "daemon off;" ]
