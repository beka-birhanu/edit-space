package controllers

import (
	"errors"
	"net/http"
	"net/url"
	"slices"
	"strconv"

	"github.com/beka-birhanu/edit-space/server/internal/adapters"
	"github.com/beka-birhanu/edit-space/server/internal/adapters/dtos"
	"github.com/beka-birhanu/edit-space/server/internal/application/services"
	"github.com/beka-birhanu/edit-space/server/internal/domain/entities"
	"github.com/google/uuid"
	"github.com/gorilla/mux"
)

type OperationController struct {
	operationService *services.OperationService
	middlewares      []mux.MiddlewareFunc
}

func NewOperationController(operationService *services.OperationService, middlewares ...mux.MiddlewareFunc) *OperationController {
	return &OperationController{operationService: operationService, middlewares: middlewares}
}

func (oc *OperationController) RegisterRoutes(router *mux.Router) {
	subRoute := router.PathPrefix("/operations").Subrouter()
	subRoute.HandleFunc("", oc.handleGetOperations).Methods(http.MethodGet, http.MethodOptions)

	for _, middleware := range oc.middlewares {
		subRoute.Use(middleware)
	}
}

func (oc *OperationController) handleGetOperations(w http.ResponseWriter, r *http.Request) {
	params, err := parseOpQueryParams(r.URL.Query())
	if err != nil {
		adapters.WriteError(w, http.StatusBadRequest, errors.New("Malformed query params"))
		return
	}

	operations, err := oc.operationService.Find(
		params.DocumentId, params.ClientId, params.Counter, params.Type,
	)
	if err != nil {
		adapters.WriteError(w, http.StatusInternalServerError, errors.New("Couldn't get operations"))
		return
	}

	if err := adapters.WriteJSON(w, http.StatusOK, operations); err != nil {
		adapters.WriteError(w, http.StatusInternalServerError, err)
		return
	}
}

func parseOpQueryParams(params url.Values) (dtos.GetOperationsDto, error) {
	documentId, err := uuid.Parse(params.Get("d"))
	if err != nil {
		return dtos.GetOperationsDto{}, err
	}
	req := dtos.GetOperationsDto{DocumentId: documentId}

	clientId, err := uuid.Parse(params.Get("cid"))
	if err == nil {
		req.ClientId = &clientId
	}
	counter, err := strconv.Atoi(params.Get("ctrgeq"))
	if err == nil {
		req.Counter = &counter
	}
	if slices.Contains([]string{
		string(entities.OperationTypeInsert),
		string(entities.OperationTypeDelete),
	}, params.Get("type")) {
		opType := entities.OperationType(params.Get("type"))
		req.Type = &opType
	}

	return req, nil
}
