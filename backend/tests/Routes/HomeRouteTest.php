<?php

declare(strict_types=1);

namespace Tests\Routes;

use Tests\HttpTestCase;

final class HomeRouteTest extends HttpTestCase
{
    public function testApiRootDoesNotServeFrontend(): void
    {
        $response = $this->request('GET', '/');

        self::assertSame(404, $response->getStatusCode());
    }
}
