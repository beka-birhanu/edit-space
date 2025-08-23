package entities

import (
	"time"

	"github.com/google/uuid"
)

type User struct {
	Id        uuid.UUID `json:"id"`
	Username  string    `json:"username"`
	CreatedAt time.Time `json:"createdAt"`
}

func NewUser(id uuid.UUID, username string) User {
	return User{
		Id:        id,
		Username:  username,
		CreatedAt: time.Now(),
	}
}

type UserCredential struct {
	Id       uuid.UUID `json:"id"`
	UserId   uuid.UUID `json:"userId"`
	PassHash string    `json:"passHash"`
}

func NewUserCredential(id uuid.UUID, userId uuid.UUID, passHash string) UserCredential {
	return UserCredential{
		Id:       id,
		UserId:   userId,
		PassHash: passHash,
	}
}

func NewUserCredentialFromUserAndPassword(user User, password string, hasher Hasher) (UserCredential, error) {
	passwordHash, err := hasher.Hash(password)

	if err != nil {
		return UserCredential{}, err
	}

	return NewUserCredential(uuid.New(), user.Id, passwordHash), nil
}

type Hasher interface {
	Hash(password string) (string, error)
	Compare(password, hash string) error
}
