package middlewares

import (
	"log"
	"net/http"

	"github.com/beka-birhanu/edit-space/server/internal/adapters"
	"github.com/beka-birhanu/edit-space/server/internal/application/services"
)

func LoggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log.Print(r.Method, r.URL.Path)
		next.ServeHTTP(w, r)
	})
}

func RemoveTrailingSlashMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if len(r.URL.Path) > 1 && r.URL.Path[len(r.URL.Path)-1] == '/' {
			log.Print("Redirecting to ", r.URL.Path[:len(r.URL.Path)-1], "\n")
			http.Redirect(w, r, r.URL.Path[:len(r.URL.Path)-1], http.StatusMovedPermanently)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func EnableCors(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		w.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, Authorization")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

type AuthMiddleware struct {
	authService *services.AuthService
}

func NewAuthMiddleware(authService *services.AuthService) AuthMiddleware {
	return AuthMiddleware{authService: authService}
}

func (am *AuthMiddleware) MiddlewareFunc(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		authDto, err := adapters.DecodeAuthHeader(authHeader)
		if err != nil {
			adapters.WriteError(w, http.StatusUnauthorized, err)
			return
		}

		userId, err := am.authService.Authenticate(authDto.Username, authDto.Password)
		if err != nil {
			adapters.WriteError(w, http.StatusUnauthorized, err)
			return
		}

		r.Header.Set("userId", userId.String())
		next.ServeHTTP(w, r)
	})
}
