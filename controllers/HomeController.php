<?php
namespace App\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Views\Twig;

class HomeController
{
    public function __construct(private Twig $twig)
    {
    }

    public function index(Request $request, Response $response): Response
    {
        return $this->twig->render($response, 'pages/home.twig', [
            'title' => 'Play List App',
        ]);
    }
}
