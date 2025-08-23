package adapters

import (
	"encoding/base64"
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"strings"

	"github.com/beka-birhanu/edit-space/server/internal/adapters/dtos"
	"github.com/google/uuid"
)

func ReadBody[T any](r *http.Request, output *T) error {
	return json.NewDecoder(r.Body).Decode(output)
}

func WriteJSON(w http.ResponseWriter, statusCode int, output interface{}) error {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	return json.NewEncoder(w).Encode(output)
}

func WriteError(w http.ResponseWriter, statusCode int, error error) {
	log.Println("error:", error.Error(), "status_code:", statusCode)
	WriteJSON(w, statusCode, map[string]interface{}{"message": error.Error(), "status_code": statusCode})
}

func DecodeAuthHeader(authentication string) (dtos.AuthDto, error) {
	split := strings.Split(authentication, " ")
	if len(split) != 2 {
		return dtos.AuthDto{}, errors.New("invalid auth header format")
	}

	basicAuthStr := split[1]
	decodedBytes, err := base64.StdEncoding.DecodeString(basicAuthStr)
	if err != nil {
		return dtos.AuthDto{}, err
	}
	authStr := string(decodedBytes)
	split = strings.Split(authStr, ":")
	if len(split) != 2 {
		return dtos.AuthDto{}, errors.New("invalid auth header format")
	}

	return dtos.AuthDto{Username: split[0], Password: split[1]}, nil
}

func GetUserId(r *http.Request) (uuid.UUID, error) {
	return uuid.Parse(r.Header.Get("userId"))
}
