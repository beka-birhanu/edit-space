package server

import (
	"database/sql"
	"fmt"
	"net/http"

	"github.com/beka-birhanu/edit-space/server/internal/adapters/controllers"
	"github.com/beka-birhanu/edit-space/server/internal/application/repositories"
	"github.com/beka-birhanu/edit-space/server/internal/application/services"
	"github.com/beka-birhanu/edit-space/server/internal/domain/entities"
	"github.com/beka-birhanu/edit-space/server/internal/infrastructure/database"
	"github.com/beka-birhanu/edit-space/server/internal/infrastructure/websocket"
	"github.com/beka-birhanu/edit-space/server/internal/server/middlewares"

	"github.com/gorilla/mux"
	"github.com/uptrace/bun"
	"github.com/uptrace/bun/dialect/pgdialect"
	"github.com/uptrace/bun/driver/pgdriver"
	"github.com/uptrace/bun/extra/bundebug"
)

type Server struct {
	Port        string
	Router      *mux.Router
	Hub         *websocket.Hub
	Controllers []controllers.Controller
	Services    Services
}

func NewServer(config Config) Server {
	services := NewServices(config)
	wsHub := websocket.NewHub()

	authMiddleware := middlewares.NewAuthMiddleware(services.AuthService)
	controllers_ := []controllers.Controller{
		// http
		controllers.NewHealthController(services.AuthService),
		controllers.NewAuthController(services.AuthService),
		controllers.NewDocumentController(services.DocumentService, authMiddleware.MiddlewareFunc),
		controllers.NewOperationController(services.OperationsService, authMiddleware.MiddlewareFunc),
		controllers.NewUserController(services.UserService),

		// websocket
		controllers.NewWebsocketAdapter(wsHub, services.DocumentService, services.AuthService),
		controllers.NewOperationAdapter(wsHub, services.OperationsService),
		controllers.NewUpdatesAdapter(wsHub, services.UserService, services.DocumentService),
	}

	return Server{Port: config.Port, Router: mux.NewRouter(), Controllers: controllers_, Hub: wsHub, Services: services}
}

func (s *Server) RegisterRoutes() {
	for _, controller := range s.Controllers {
		controller.RegisterRoutes(s.Router)
	}
}

func (s *Server) RegisterMiddlewares() {
	s.Router.Use(middlewares.EnableCors)
	s.Router.Use(middlewares.LoggingMiddleware)
}

func (s *Server) Start() {
	fmt.Printf("Server running on port %v\n", s.Port)
	go s.Hub.Run()
	err := http.ListenAndServe(
		fmt.Sprintf("0.0.0.0:%v", s.Port),
		middlewares.RemoveTrailingSlashMiddleware(s.Router),
	)
	if err != nil {
		panic(err)
	}
}

type Config struct {
	Port string
	DB   *bun.DB
}

func NewConfig(port, dsn string) Config {
	sqldb := sql.OpenDB(pgdriver.NewConnector(pgdriver.WithDSN(dsn)))
	db := bun.NewDB(sqldb, pgdialect.New())
	db.AddQueryHook(bundebug.NewQueryHook(bundebug.WithVerbose(true)))

	return Config{
		Port: port,
		DB:   db,
	}
}

type Services struct {
	DocumentService   *services.DocumentService
	OperationsService *services.OperationService
	AuthService       *services.AuthService
	UserService       *services.UserService
}

func NewServices(config Config) Services {
	documentDb := database.NewPostgresDB[entities.Document](config.DB)
	characterDb := database.NewPostgresDB[entities.Character](config.DB)
	operationDb := database.NewPostgresDB[entities.Operation](config.DB)
	userCredentialDb := database.NewPostgresDB[entities.UserCredential](config.DB)
	userDb := database.NewPostgresDB[entities.User](config.DB)

	characterRepo := repositories.NewPgCharacterRepository(characterDb)
	operationRepo := repositories.NewPgOperationRepository(operationDb)
	documentRepo := repositories.NewPgDocumentRepository(documentDb)
	credentialRepo := repositories.NewPgUserCredentialRepository(userCredentialDb)
	userRepo := repositories.NewPgUserRepository(userDb)

	documentService := services.NewDocumentService(documentRepo, characterRepo)
	operationsService := services.NewOperationService(operationRepo, characterRepo)
	authService := services.NewAuthService(userRepo, credentialRepo)
	userService := services.NewUserService(userRepo)

	return Services{
		DocumentService:   documentService,
		OperationsService: operationsService,
		AuthService:       authService,
		UserService:       userService,
	}
}
