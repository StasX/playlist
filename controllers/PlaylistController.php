<?php
namespace App\Controllers;

use App\Models\PlaylistModel;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class PlaylistController
{
    public function getAllPlaylists(Request $request, Response $response): Response
    {
        $playlists = PlaylistModel::all();
        $response->getBody()->write(json_encode($playlists));
        return $response->withHeader('Content-Type', 'application/json');
    }

    public function getPlaylist(Request $request, Response $response, array $args): Response
    {
        $playlist = PlaylistModel::find($args['id']);
        if (! $playlist) {
            return $response->withStatus(404);
        }
        $response->getBody()->write(json_encode($playlist));
        return $response->withHeader('Content-Type', 'application/json');
    }

    public function createPlaylist(Request $request, Response $response): Response
    {
        $data = json_decode((string) $request->getBody(), true);
        if (
            ! is_array($data) ||
            ! isset($data['name']) ||
            ! isset($data['image']) ||
            ! isset($data['songs'])
        ) {
            return $response->withStatus(400);
        }

        $playlist        = new PlaylistModel();
        $playlist->name  = $data['name'];
        $playlist->image = $data['image'];
        $playlist->songs = json_encode($data['songs']);
        $playlist->save();
        return $response->withStatus(201);
    }

    public function updatePlaylist(Request $request, Response $response, array $args): Response
    {
        $data = json_decode($request->getBody(), true);
        if (! (isset($data['name']) || isset($data['image']) || isset($data['songs']))) {
            return $response->withStatus(400);
        }
        $playlist = PlaylistModel::find($args['id']);
        if (! $playlist) {
            return $response->withStatus(404);
        }
        if (isset($data['name'])) {
            $playlist->name = $data['name'];
        }
        if (isset($data['image'])) {
            $playlist->image = $data['image'];
        }
        if (isset($data['songs'])) {
            $playlist->songs = json_encode($data['songs']);
        }
        $playlist->save();
        return $response->withStatus(202);
    }

    public function deletePlaylist(Request $request, Response $response, array $args): Response
    {
        $id       = $args['id'];
        $playlist = PlaylistModel::find($id);
        if ($playlist) {
            $playlist->delete();
            $response->withStatus(200);
            return $response;
        }
        $response->withStatus(400);
        return $response;
    }
}
