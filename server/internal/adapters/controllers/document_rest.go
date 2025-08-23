package controllers

import (
	"errors"
	"net/http"

	"github.com/beka-birhanu/edit-space/server/internal/adapters"
	"github.com/beka-birhanu/edit-space/server/internal/adapters/dtos"
	"github.com/beka-birhanu/edit-space/server/internal/application/services"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
)

type DocumentController struct {
	documentService *services.DocumentService
	middlewares     []mux.MiddlewareFunc
}

func NewDocumentController(documentService *services.DocumentService, middlewares ...mux.MiddlewareFunc) *DocumentController {
	return &DocumentController{documentService: documentService, middlewares: middlewares}
}

func (dc *DocumentController) RegisterRoutes(router *mux.Router) {
	subRoute := router.PathPrefix("/documents").Subrouter()
	subRoute.HandleFunc("", dc.handleNewDocument).Methods(http.MethodPost, http.MethodOptions)
	subRoute.HandleFunc("", dc.handleGetDocuments).Methods(http.MethodGet, http.MethodOptions)
	subRoute.HandleFunc("/{documentId}", dc.handleDeleteDocument).Methods(http.MethodDelete, http.MethodOptions)
	router.HandleFunc("/documents/{documentId}", dc.handleGetDocument).Methods(http.MethodGet, http.MethodOptions)

	for _, middleware := range dc.middlewares {
		subRoute.Use(middleware)
	}
}

func (dc *DocumentController) handleGetDocuments(w http.ResponseWriter, r *http.Request) {
	userId, err := adapters.GetUserId(r)
	if err != nil {
		adapters.WriteError(w, http.StatusInternalServerError, errors.New("unable to get user"))
		return
	}

	documents, err := dc.documentService.GetDocumentsByUserId(userId)
	if err != nil {
		adapters.WriteError(w, http.StatusInternalServerError, errors.New("unable to fetch document"))
		return
	}

	if err := adapters.WriteJSON(w, http.StatusOK, documents); err != nil {
		adapters.WriteError(w, http.StatusInternalServerError, errors.New("server error"))
	}
}

func (dc *DocumentController) handleNewDocument(w http.ResponseWriter, r *http.Request) {
	var request dtos.NewDocumentRequestDTO
	err := adapters.ReadBody(r, &request)
	if err != nil {
		adapters.WriteError(w, http.StatusBadRequest, errors.New("invalid request body"))
		return
	}

	userId, err := adapters.GetUserId(r)
	if err != nil {
		adapters.WriteError(w, http.StatusInternalServerError, errors.New("unable to get user"))
		return
	}

	document, err := dc.documentService.CreateDocument(request.Title, userId)
	if err != nil {
		adapters.WriteError(w, http.StatusInternalServerError, errors.New("server error"))
		return
	}

	if err := adapters.WriteJSON(w, http.StatusCreated, document); err != nil {
		adapters.WriteError(w, http.StatusInternalServerError, errors.New("server error"))
		return
	}
}

func (dc *DocumentController) handleGetDocument(w http.ResponseWriter, r *http.Request) {
	documentId, err := uuid.Parse(mux.Vars(r)["documentId"])
	if err != nil {
		adapters.WriteError(w, http.StatusBadRequest, errors.New("invalid document id"))
		return
	}

	document, err := dc.documentService.GetDocumentById(documentId)
	if err != nil {
		adapters.WriteError(w, http.StatusNotFound, errors.New("document Not found"))
		return
	}

	characters, err := dc.documentService.GetCharacters(documentId)
	if err != nil {
		adapters.WriteError(w, http.StatusInternalServerError, errors.New("server error"))
		return
	}

	response := dtos.GetDocumentResponseDTO{Characters: characters, Document: document}
	if err := adapters.WriteJSON(w, http.StatusOK, response); err != nil {
		adapters.WriteError(w, http.StatusInternalServerError, errors.New("server error"))
		return
	}
}

func (dc *DocumentController) handleDeleteDocument(w http.ResponseWriter, r *http.Request) {
	documentId, err := uuid.Parse(mux.Vars(r)["documentId"])
	if err != nil {
		adapters.WriteError(w, http.StatusBadRequest, errors.New("document id required"))
		return
	}
	document, err := dc.documentService.GetDocumentById(documentId)
	if err != nil {
		adapters.WriteError(w, http.StatusNotFound, errors.New("document not found"))
		return
	}
	userId, err := uuid.Parse(r.Header.Get("userId"))

	if userId != document.OwnerId {
		adapters.WriteError(w, http.StatusForbidden, errors.New("operation not allowed"))
	}
	err = dc.documentService.Delete(document)
	if err != nil {
		adapters.WriteError(w, http.StatusInternalServerError, errors.New("server error"))
		return
	}

	if err := adapters.WriteJSON(w, http.StatusNoContent, ""); err != nil {
		adapters.WriteError(w, http.StatusInternalServerError, errors.New("server error"))
	}
}
