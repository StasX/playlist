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
        $playlists = PlaylistModel::query()->get(['id', 'name', 'image'])->toArray();
        $response->getBody()->write(json_encode($playlists, JSON_THROW_ON_ERROR));
        return $response->withHeader('Content-Type', 'application/json');
    }

    /** @param array{id: string} $args */
    public function getPlaylist(Request $request, Response $response, array $args): Response
    {
        $playlist = PlaylistModel::query()->find($args['id'], ['id', 'name', 'image']);
        if ($playlist === null) {
            return $response->withStatus(404);
        }
        $response->getBody()->write(json_encode($playlist, JSON_THROW_ON_ERROR));
        return $response->withHeader('Content-Type', 'application/json');
    }

    public function createPlaylist(Request $request, Response $response): Response
    {
        $payload = json_decode((string) $request->getBody());
        $data = $payload instanceof \stdClass ? get_object_vars($payload) : null;
        if ($data === null || ! PlaylistValidator::validPlaylist($data)) {
            return $response->withStatus(400);
        }

        $playlist = new PlaylistModel();
        $playlist->name = $data['name'];
        $playlist->image = $data['image'];
        $playlist->songs = json_encode($data['songs'], JSON_THROW_ON_ERROR);
        $playlist->save();
        $response->getBody()->write(json_encode([
            'id' => $playlist->id,
            'name' => $playlist->name,
            'image' => $playlist->image,
        ], JSON_THROW_ON_ERROR));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(201);
    }

    /** @param array{id: string} $args */
    public function updatePlaylist(Request $request, Response $response, array $args): Response
    {
        $payload = json_decode((string) $request->getBody());
        $data = $payload instanceof \stdClass ? get_object_vars($payload) : null;
        if ($data === null || ! PlaylistValidator::validPlaylist($data, true)) {
            return $response->withStatus(400);
        }
        $playlist = PlaylistModel::query()->find($args['id']);
        if ($playlist === null) {
            return $response->withStatus(404);
        }
        if (isset($data['name'])) {
            $playlist->name = $data['name'];
        }
        if (isset($data['image'])) {
            $playlist->image = $data['image'];
        }
        if (isset($data['songs'])) {
            $playlist->songs = json_encode($data['songs'], JSON_THROW_ON_ERROR);
        }
        $playlist->save();
        return $response->withStatus(200);
    }

    /** @param array{id: string} $args */
    public function deletePlaylist(Request $request, Response $response, array $args): Response
    {
        $id = $args['id'];
        $playlist = PlaylistModel::query()->find($id);
        if ($playlist !== null) {
            $playlist->delete();
            return $response->withStatus(204);
        }
        return $response->withStatus(404);
    }
}
