package dtos

import "github.com/google/uuid"

type MessageType string

const (
	MessageTypeOperation   MessageType = "operation"
	MessageTypeCursor                  = "cursor"
	MessageTypeTitleChange             = "title_change"
)

type CursorUpdate struct {
	Start    int       `json:"start"`
	Length   int       `json:"length"`
	Username string    `json:"username"`
	Color    string    `json:"color"`
	ClientId uuid.UUID `json:"clientId"`
}

type CursorUpdateReq struct {
	Start  int    `json:"start"`
	Length int    `json:"length"`
	Color  string `json:"color"`
}

type TitleUpdate struct {
	DocumentId uuid.UUID `json:"documentId"`
	ClientId   uuid.UUID `json:"clientId"`
	Title      string    `json:"title"`
}
