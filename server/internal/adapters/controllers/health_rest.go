package controllers

import (
	"net/http"

	"github.com/beka-birhanu/edit-space/server/internal/adapters"
	"github.com/beka-birhanu/edit-space/server/internal/application/services"
	"github.com/gorilla/mux"
)

type HealthController struct {
	authService *services.AuthService
}

func NewHealthController(authService *services.AuthService) *HealthController {
	return &HealthController{authService: authService}
}

func (hc *HealthController) RegisterRoutes(router *mux.Router) {
	subroute := router.PathPrefix("/health").Subrouter()
	subroute.HandleFunc("", hc.handleHealth).Methods(http.MethodGet, http.MethodOptions)
	subroute.HandleFunc("/auth", hc.handleAuthHealth).Methods(http.MethodGet, http.MethodOptions)
}

func (hc *HealthController) handleHealth(w http.ResponseWriter, r *http.Request) {
	if err := adapters.WriteJSON(w, http.StatusOK, ""); err != nil {
		adapters.WriteError(w, http.StatusInternalServerError, err)
		return
	}
}

func (hc *HealthController) handleAuthHealth(w http.ResponseWriter, r *http.Request) {
	authHeader := r.Header.Get("Authorization")
	authDto, err := adapters.DecodeAuthHeader(authHeader)
	if err != nil {
		adapters.WriteError(w, http.StatusUnauthorized, err)
		return
	}

	_, err = hc.authService.Authenticate(authDto.Username, authDto.Password)
	if err != nil {
		adapters.WriteError(w, http.StatusUnauthorized, err)
		return
	}

	if err := adapters.WriteJSON(w, http.StatusOK, ""); err != nil {
		adapters.WriteError(w, http.StatusInternalServerError, err)
		return
	}
}
