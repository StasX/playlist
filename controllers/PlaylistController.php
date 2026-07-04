<?php

namespace App\Controllers;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class PlaylistController {
    public function getAllPlaylists(Request $request, Response $response): Response {
        $response->getBody()->write("Hello, World!");
        return $response;
    }

    public function getPlaylist(Request $request, Response $response, array $args): Response {
        $response->getBody()->write("Hello, World! ID: " . $args['id']);
        return $response;
    }

    public function createPlaylist(Request $request, Response $response, array $args): Response {
        $response->getBody()->write("Hello, World! Playlist created!");
        return $response;
    }

    public function updatePlaylist(Request $request, Response $response, array $args): Response {
        $response->getBody()->write("Hello, World! Playlist ID: " . $args['id']);
        return $response;
    }
    
    public function deletePlaylist(Request $request, Response $response, array $args): Response {
        $response->getBody()->write("Hello, World! Playlist ID: " . $args['id']);
        return $response;
    }
}
