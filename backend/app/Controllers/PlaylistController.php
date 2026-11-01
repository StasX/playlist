<?php
namespace App\Controllers;

use App\Models\PlaylistModel;
use App\Validation\PlaylistValidator;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class PlaylistController
{
    public function getAllPlaylists(Request $request, Response $response): Response
    {
        $playlists = PlaylistModel::select('id', 'name', 'image')->get()->toArray();
        $response->getBody()->write(json_encode($playlists));
        return $response->withHeader('Content-Type', 'application/json');
    }

    public function getPlaylist(Request $request, Response $response, array $args): Response
    {
        $playlist = PlaylistModel::select('id', 'name', 'image')->find($args['id']);
        if (! $playlist) {
            return $response->withStatus(404);
        }
        $response->getBody()->write(json_encode($playlist));
        return $response->withHeader('Content-Type', 'application/json');
    }

    public function createPlaylist(Request $request, Response $response): Response
    {
        $payload = json_decode((string) $request->getBody());
        if (! $payload instanceof \stdClass || ! PlaylistValidator::validPlaylist(get_object_vars($payload))) {
            return $response->withStatus(400);
        }
        $data = get_object_vars($payload);

        $playlist        = new PlaylistModel();
        $playlist->name  = $data['name'];
        $playlist->image = $data['image'];
        $playlist->songs = json_encode($data['songs']);
        $playlist->save();
        $response->getBody()->write(json_encode([
            'id' => $playlist->id,
            'name' => $playlist->name,
            'image' => $playlist->image,
        ]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(201);
    }

    public function updatePlaylist(Request $request, Response $response, array $args): Response
    {
        $payload = json_decode((string) $request->getBody());
        if (! $payload instanceof \stdClass || ! PlaylistValidator::validPlaylist(get_object_vars($payload), true)) {
            return $response->withStatus(400);
        }
        $data = get_object_vars($payload);
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
        return $response->withStatus(200);
    }

    public function deletePlaylist(Request $request, Response $response, array $args): Response
    {
        $id       = $args['id'];
        $playlist = PlaylistModel::find($id);
        if ($playlist) {
            $playlist->delete();
            return $response->withStatus(204);
        }
        return $response->withStatus(404);
    }
}
