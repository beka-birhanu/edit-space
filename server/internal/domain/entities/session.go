package entities

import "github.com/google/uuid"

type Session struct {
	Id     uuid.UUID `json:"id"`
	UserId uuid.UUID `json:"userId"`
}
