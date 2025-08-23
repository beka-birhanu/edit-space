package controllers

import (
	"github.com/gorilla/mux"
)

type Controller interface {
	RegisterRoutes(r *mux.Router)
}
