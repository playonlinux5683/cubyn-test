#! /bin/bash

################################################################################
# Commands:
#
# - start:
#		-> Start all containers
# - stop:
#		-> Stop all started containers
# - purge:
#		-> Remove all images in cache
# - help:
#		-> Show this help
# - exit:
#		-> Exit the program
################################################################################

COMPOSE_PROJECT_NAME=cubyntest

function entrypoint {
	echo 'Welcome to '${COMPOSE_PROJECT_NAME} 'application'

	[ ! -z "$1" ] && {
		wrapCall "$1"
	} || {

        echo
        echo "Here is the interactive mode."
        echo "You can also pass one of the following command to the script to perform it immediatly."
        echo "Take care of dependencies between commands. Example you cannot test before launching the application."

		local commands=("auto" "start" "test" "coverage" "stop" "purge" "help" "exit")
        local isFinished=false

        until $isFinished; do
            echo
            echo "Choose your action"

            select command in "${commands[@]}"; do
                case $command in
                    auto | start | test | coverage | stop | purge | help )
                        break
                    ;;
                    exit )
                        isFinished=true
                        break
                    ;;
                esac
            done
            [ $isFinished == false ] && {
                wrapCall $command
            }
        done
	}

	echo 'Good bye'
}

# Wrap function 
function wrapCall {
	local func="$1"
	shift
	echo "Begin of $func command"
	$func $@
	echo "End of $func command"
}

# Wait for all project containers to be running before performing 
# Useful to be sure that database container is fully effective.

function run {
	local command="$1"

	local containers=($(docker ps --format {{.Names}} | grep "${COMPOSE_PROJECT_NAME}"))

	for container in "${containers[@]}"
	do
		isUp=$(docker inspect -f {{.State.Running}} ${container})
		until $isUp ; do
			>&2 echo "Container ${container} is unavailable - sleeping"
			sleep 1
			isUp=$(docker inspect -f {{.State.Running}} ${container})
		done
		>&2 echo "Container ${container} is up - executing command"

		docker exec -it ${container} sh -c "$command"
	done;
}

function auto {
	wrapCall "start"
	wrapCall "test"
	wrapCall "coverage"
	wrapCall "stop"
}

# Start application
function start {
    docker-compose up -d --build --force-recreate
}

# Run test
function test {
    run "npm run test"
}

# Run test coverage
function coverage {
    run "npm run test:coverage"
}

# Stop application
function stop {
    docker-compose down
}

# Purge apllication images
function purge {

	local images=$(docker images -q "${COMPOSE_PROJECT_NAME}*")
	[ ! -z "$images" ] && {
		docker rmi $images -f
	} || {
		echo "Nothing to do"
	}
}

# Usage function
function help {
	local script=$(basename $0)
	cat <<-EOF
	Usage: $script
		Script for managing operations on containers which prompt a list of availables commands:
            start => Start all containers
            test => run container tests
            coverage => run container test coverage
            stop => Stop all started containers
            purge => Remove all images in cache
            help => Show this help
            exit => Exit the program
	EOF
}

entrypoint $@
