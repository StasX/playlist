<?php
namespace App\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class SongsController
{
    public function getAllSongs(Request $request, Response $response): Response
    {
        $response->getBody()->write("Hello, World!");
        return $response;
    }

    public function updateSongs(Request $request, Response $response, array $args): Response
    {
        $response->getBody()->write("Hello, World! Song ID: " . $args['id']);
        return $response;
    }
}
