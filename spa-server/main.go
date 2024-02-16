package main

import (
	"github.com/gin-gonic/gin"
	"github.com/mandrigin/gin-spa/spa"
)

func main() {
	// gin.SetMode(gin.ReleaseMode)
	r := gin.Default()
	r.Use(spa.Middleware("/", "../dist/")) // your build of React or other SPA
	r.Run("127.0.0.1:8030")
}