package application

import (
	"math/rand"
	"time"
)

type Color string

const (
	DARK_RED   Color = "#820933"
	VIOLET     Color = "#D84797"
	MINT       Color = "#D2FDFF"
	SKYBLUE    Color = "#3ABEFF"
	CYAN       Color = "#26FFE6"
	PINK       Color = "#F374AE"
	DARKGREEN  Color = "#32533D"
	SLATE      Color = "#D8CFAF"
	SLATEGREEN Color = "#B8B42D"
	AVOCADO    Color = "#697A21"
	RED        Color = "#DD403A"
	JETDARK    Color = "#3E363F"
	IVORY      Color = "#FFFCE8"
)

var colors = []Color{
	DARK_RED, VIOLET, MINT, SKYBLUE, CYAN, PINK, DARKGREEN,
	SLATE, SLATEGREEN, AVOCADO, RED, JETDARK, IVORY,
}

func shuffleColors(colors []Color) {
	rand.Seed(time.Now().UnixNano())
	for i := len(colors) - 1; i > 0; i-- {
		j := rand.Intn(i + 1)
		colors[i], colors[j] = colors[j], colors[i]
	}
}

func ColorGenerator() func() Color {
	shuffleColors(colors)
	idx := 0

	return func() Color {
		color := colors[idx]
		idx = (idx + 1) % len(colors)
		return color
	}
}
