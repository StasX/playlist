<?php

namespace App\Validation;

class PlaylistValidator
{
    public static function validPlaylist(array $data, bool $partial = false): bool
    {
        if (! $partial && ! isset($data['name'], $data['image'], $data['songs'])) {
            return false;
        }
        if (! array_intersect(['name', 'image', 'songs'], array_keys($data))) {
            return false;
        }
        if (array_key_exists('name', $data) &&
            (! self::validName($data['name']) || mb_strlen($data['name']) > 100)
        ) {
            return false;
        }
        if (array_key_exists('image', $data) &&
            (! self::validUrl($data['image']) || mb_strlen($data['image']) > 1000)
        ) {
            return false;
        }
        return ! array_key_exists('songs', $data) || self::validSongs($data['songs']);
    }

    public static function validSongs(mixed $songs): bool
    {
        if (! is_array($songs) || ! array_is_list($songs)) {
            return false;
        }
        foreach ($songs as $song) {
            if (! $song instanceof \stdClass ||
                ! self::validName($song->name ?? null) ||
                ! self::validUrl($song->url ?? null)
            ) {
                return false;
            }
        }
        // The database stores songs in a TEXT column (65,535 bytes).
        $encoded = json_encode($songs);
        return $encoded !== false && strlen($encoded) <= 65535;
    }

    private static function validName(mixed $name): bool
    {
        return is_string($name) && trim($name) !== '';
    }

    private static function validUrl(mixed $url): bool
    {
        return is_string($url) && filter_var($url, FILTER_VALIDATE_URL) !== false &&
            in_array(strtolower((string) parse_url($url, PHP_URL_SCHEME)), ['http', 'https'], true);
    }
}
