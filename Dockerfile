FROM node:20.6.0 as node

FROM composer:2.10 as composer

FROM dunglas/frankenphp:1.12.4-php8

