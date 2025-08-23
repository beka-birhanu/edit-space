package entities

import (
	"time"

	"github.com/google/uuid"
)

type Document struct {
	Id        uuid.UUID `json:"id" bun:",pk"`
	Title     string    `json:"title"`
	CreatedAt time.Time `json:"createdAt"`
	OwnerId   uuid.UUID `json:"ownerId"`
}

func NewDocument(id, ownerId uuid.UUID, title string) Document {
	return Document{
		Id:        id,
		Title:     title,
		CreatedAt: time.Now(),
		OwnerId:   ownerId,
	}
}
