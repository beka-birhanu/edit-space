package controllers

import (
	"encoding/json"
	"errors"
	"github.com/beka-birhanu/edit-space/server/internal/adapters"
	"github.com/beka-birhanu/edit-space/server/internal/adapters/dtos"
	"github.com/beka-birhanu/edit-space/server/internal/application/services"
	"github.com/gorilla/mux"
	"net/http"
)

type AuthController struct {
	authService *services.AuthService
}

func NewAuthController(authService *services.AuthService) *AuthController {
	return &AuthController{authService: authService}
}

func (ac *AuthController) RegisterRoutes(router *mux.Router) {
	subRoute := router.PathPrefix("/auth").Subrouter()
	subRoute.HandleFunc("/login", ac.handleLogin).Methods(http.MethodPost, http.MethodOptions)
	subRoute.HandleFunc("/register", ac.handleRegister).Methods(http.MethodPost, http.MethodOptions)
}

func (ac *AuthController) handleLogin(w http.ResponseWriter, r *http.Request) {
	var body dtos.AuthDto

	err := json.NewDecoder(r.Body).Decode(&body)
	if err != nil {
		adapters.WriteError(w, http.StatusBadRequest, err)
		return
	}

	userId, err := ac.authService.Authenticate(body.Username, body.Password)
	if err != nil {
		adapters.WriteError(w, http.StatusUnauthorized, errors.New("invalid credentials"))
		return
	}

	if err := adapters.WriteJSON(w, http.StatusOK, map[string]interface{}{"id": userId}); err != nil {
		adapters.WriteError(w, http.StatusInternalServerError, err)
	}
}

func (ac *AuthController) handleRegister(w http.ResponseWriter, r *http.Request) {
	var body dtos.AuthDto

	err := json.NewDecoder(r.Body).Decode(&body)
	if err != nil {
		adapters.WriteError(w, http.StatusBadRequest, errors.New("invalid body format"))
		return
	}

	userId, err := ac.authService.Create(body.Username, body.Password)

	if err != nil {
		if err.Error() == "username exists" {
			adapters.WriteError(w, http.StatusBadRequest, err)
			return
		}
		adapters.WriteError(w, http.StatusInternalServerError, err)
		return
	}

	if err := adapters.WriteJSON(w, http.StatusOK, map[string]interface{}{"id": userId}); err != nil {
		adapters.WriteError(w, http.StatusInternalServerError, err)
	}
}
