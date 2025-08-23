package dtos

import "github.com/google/uuid"

type WsConnectionDto struct {
	UserId     uuid.UUID
	ClientId   uuid.UUID
	DocumentId uuid.UUID
}
