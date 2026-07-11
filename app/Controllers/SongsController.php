<?php
namespace App\Controllers;

use App\Models\PlaylistModel;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class SongsController
{
    public function getAllSongs(Request $request, Response $response, array $args): Response
    {
        $playlist = PlaylistModel::find($args['id']);
        if (! $playlist) {
            return $response->withStatus(404);
        }
        $response->getBody()->write(json_encode(['songs' => $playlist->songs]));
        return $response->withHeader('Content-Type', 'application/json');
    }

    public function updateSongs(Request $request, Response $response, array $args): Response
    {
        if (! isset($data['songs']) || ! is_array($data['songs']) ||
        !array_key_exists('name', $data['songs']) ||
        !array_key_exists('url', $data['songs'])
    ) {
            return $response->withStatus(400);
        }
        $playlist = PlaylistModel::find($args['id']);
        if (! $playlist) {
            return $response->withStatus(404);
        }
        $data = json_decode($request->getBody(), true);

        $playlist->songs = json_encode($data['songs']);
        $playlist->save();
        return $response->withStatus(202);
    }
}
