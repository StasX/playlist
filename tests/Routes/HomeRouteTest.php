<?php

declare(strict_types=1);

namespace Tests\Routes;

use Tests\HttpTestCase;

final class HomeRouteTest extends HttpTestCase
{
    public function testHomePageReturnsSuccessfulResponse(): void
    {
        $response = $this->request('GET', '/');

        self::assertSame(200, $response->getStatusCode());
        self::assertNotSame('', trim((string) $response->getBody()));
    }
}
