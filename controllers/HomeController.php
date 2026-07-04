<?php
namespace App\Controllers;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Views\Twig;

class HomeController {
    public function index(Request $request, Response $response): Response {
        return Twig::fromRequest($request)->render($response, 'pages/home.twig', [
            'title' => 'Home',
            'message' => 'Welcome to Slim 4 + Twig'
        ]);
    }
}
