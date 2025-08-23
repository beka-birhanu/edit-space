package main

import (
	"flag"
	"fmt"
	"log"
	"os"

	"github.com/beka-birhanu/edit-space/server/cmd/migrations"

	"github.com/beka-birhanu/edit-space/server/internal/server"
	"github.com/joho/godotenv"
)

func main() {
	godotenv.Load()

	defaultDsn := os.Getenv("DATABASE_URL")
	if defaultDsn == "" {
		defaultDsn = getDsn()
	}
	port := flag.String("port", "8080", "Port to run the server on")
	dsn := flag.String("dsn", defaultDsn, "Data source name for the database")

	var migrate bool
	flag.BoolVar(&migrate, "migrate", false, "migrate the database to the latest version")

	flag.Parse()

	if *dsn == "" {
		panic("DSN is required")
	}

	if migrate {
		err := migrations.Migrate(*dsn)
		if err != nil {
			log.Fatal("migration failed... exiting...")
		} else {
			log.Println("migrated successfully... exiting...")
		}
		return
	}

	config := server.NewConfig(*port, *dsn)
	server := server.NewServer(config)

	server.RegisterMiddlewares()
	server.RegisterRoutes()
	server.Start()
}

func getDsn() string {
	user := os.Getenv("POSTGRES_USER")
	password := os.Getenv("POSTGRES_PASSWORD")
	db := os.Getenv("POSTGRES_DB")
	port := os.Getenv("POSTGRES_PORT")
	if port == "" {
		port = "5432"
	}
	host := os.Getenv("POSTGRES_HOST")
	if host == "" {
		host = "postgres"
	}
	if user == "" || password == "" || db == "" {
		return ""
	}
	dsn := fmt.Sprintf(
		"postgres://%s:%s@%s:%s/%s?sslmode=disable",
		user, password, host, port, db)
	return dsn
}
