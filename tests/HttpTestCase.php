<?php

declare(strict_types=1);

namespace Tests;

use PHPUnit\Framework\TestCase;
use Psr\Http\Message\ResponseInterface;
use Slim\App;
use Slim\Psr7\Factory\ServerRequestFactory;
use Slim\Psr7\Factory\StreamFactory;

abstract class HttpTestCase extends TestCase
{
    protected App $app;

    protected function setUp(): void
    {
        parent::setUp();

        /** @var App $app */
        $app = require dirname(__DIR__) . '/bootstrap/conf.php';

        $this->app = $app;
    }

    /**
     * @param array<string, mixed>|list<mixed>|null $data
     */
    protected function request(
        string $method,
        string $path,
        ?array $data = null
    ): ResponseInterface {
        $request = (new ServerRequestFactory())
            ->createServerRequest($method, $path);

        if ($data !== null) {
            $json = json_encode(
                $data,
                JSON_THROW_ON_ERROR
            );

            $request = $request
                ->withHeader('Content-Type', 'application/json')
                ->withHeader('Accept', 'application/json')
                ->withBody(
                    (new StreamFactory())->createStream($json)
                );
        }

        return $this->app->handle($request);
    }

    /**
     * @return array<string, mixed>|list<mixed>
     */
    protected function json(
        ResponseInterface $response
    ): array {
        $body = (string) $response->getBody();

        self::assertNotSame(
            '',
            $body,
            'Expected a JSON response, but the body was empty.'
        );

        self::assertJson($body);

        $decoded = json_decode(
            $body,
            true,
            512,
            JSON_THROW_ON_ERROR
        );

        self::assertIsArray($decoded);

        return $decoded;
    }
}
