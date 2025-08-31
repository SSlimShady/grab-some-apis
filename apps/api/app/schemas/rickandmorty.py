from enum import Enum

from pydantic import BaseModel


class CharacterStatus(str, Enum):
    ALIVE = "Alive"
    DEAD = "Dead"
    UNKNOWN = "unknown"


class CharacterGender(str, Enum):
    MALE = "Male"
    FEMALE = "Female"
    GENDERLESS = "Genderless"
    UNKNOWN = "unknown"


class RickAndMortyCharacterRequest(BaseModel):
    name: str | None = None
    status: CharacterStatus | None = None
    species: str | None = None
    type: str | None = None
    gender: CharacterGender | None = None
    page: int | None = None


class RickAndMortyCharacter(BaseModel):
    id: int
    name: str | None = None
    status: CharacterStatus | None = None
    species: str | None = None
    type: str | None = None
    gender: CharacterGender | None = None
    origin: dict | None = None
    location: dict | None = None
    image: str | None = None
    episode: list[str] | None = None
    url: str | None = None
    created: str | None = None


class RickAndMortyPagination(BaseModel):
    count: int
    pages: int
    next: str | None = None
    prev: str | None = None


class RickAndMortyCharacterResponse(BaseModel):
    info: RickAndMortyPagination
    results: list[RickAndMortyCharacter] | None = None


class RickAndMortyLocationRequest(BaseModel):
    name: str | None = None
    type: str | None = None
    dimension: str | None = None


class RickAndMortyLocation(BaseModel):
    id: int
    name: str | None = None
    type: str | None = None
    dimension: str | None = None
    residents: list[str] | None = None
    url: str | None = None
    created: str | None = None


class RickAndMortyLocationResponse(BaseModel):
    info: RickAndMortyPagination
    results: list[RickAndMortyLocation] | None = None


class RickAndMortyEpisodeRequest(BaseModel):
    name: str | None = None
    episode: str | None = None


class RickAndMortyEpisode(BaseModel):
    id: int
    name: str | None = None
    air_date: str | None = None
    episode: str | None = None
    characters: list[str] | None = None
    url: str | None = None
    created: str | None = None


class RickAndMortyEpisodeResponse(BaseModel):
    info: RickAndMortyPagination
    results: list[RickAndMortyEpisode] | None = None
