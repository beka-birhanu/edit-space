package entities

import (
	"github.com/beka-birhanu/edit-space/server/internal/domain/types"

	"github.com/google/uuid"
)

type Character struct {
	Id         uuid.UUID      `json:"id" bun:",pk"`
	DocumentId uuid.UUID      `json:"documentId"`
	Position   types.Position `json:"position" bun:",array"`
	Value      string         `json:"value"`
}

func NewCharacter(id, documentId uuid.UUID, position types.Position, value string) Character {
	return Character{
		Id:         id,
		DocumentId: documentId,
		Position:   position,
		Value:      value,
	}
}
