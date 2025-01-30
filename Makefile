all			:
					bash ./scripts/setup_django.sh
					mkdir -p ./postgres
					mkdir -p ./nginx
					docker-compose -f ./docker-compose.yml --build
					docker-compose -f ./docker-compose.yml up -d

down		:
					docker-compose -f ./dockers/docker-compose.yml down

scripts		:
					bash ./backend/scripts/setup_django.sh

clean		:
					docker container stop postgres nginx
					docker network rm frontend
					docker network rm backend

fclean		: 		clean
					rm -rf /dockers/django
					rm -rf /backend/db.sqlite3
					rm -rf ./postgres
					rm -rf ./nginx
					@docker system prune -af

re			:		fclean all

.PHONY		:		all down scripts clean fclean re
