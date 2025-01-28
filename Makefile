all			:
					scripts
					mkdir -p /backend/postgresql
					mkdir -p /frontend/nginx
					docker-compose -f ./docker-compose.yml --build
					docker-compose -f ./dockers/docker-compose.yml up -d

down		:
					docker-compose -f ./dockers/docker-compose.yml down

scripts		:
					bash ./backend/scripts/setup_django.sh

clean		:
					docker container stop postgresql nginx
					docker network rm frontend
					docker network rm backend

fclean		: 		clean
					rm -rf /backend/django
					rm -rf /backend/postgresql
					rm -rf /frontend/nginx
					@docker system prune -af

re			:		fclean all

.PHONY		:		all down scripts clean fclean re
