from typing import List

from fastapi import APIRouter, Depends, HTTPException, status

from app.schemas.rickandmorty import (
    RickAndMortyCharacter,
    RickAndMortyCharacterRequest,
    RickAndMortyCharacterResponse,
    RickAndMortyEpisodeRequest,
    RickAndMortyEpisodeResponse,
    RickAndMortyLocationRequest,
    RickAndMortyLocationResponse,
)
from app.services.rickandmorty_service import (
    RickAndMortyAPIError,
    RickAndMortyService,
    get_rick_and_morty_service,
)

router = APIRouter()


@router.get(
    "/character/{characters_id}",
    response_model=RickAndMortyCharacter | List[RickAndMortyCharacter],
    status_code=status.HTTP_200_OK,
    summary="Get Rick and Morty Characters by IDs",
)
async def get_characters_by_ids(
    characters_id: str,
    rick_and_morty_service: RickAndMortyService = Depends(
        get_rick_and_morty_service),
):
    try:
        return await rick_and_morty_service.get_characters_by_ids(characters_id)
    except RickAndMortyAPIError as e:
        if e.status_code == 404:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Character not found",
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Rick and Morty API error",
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=("Internal Server Error while fetching Rick and Morty characters"),
        )


@router.get(
    "/character",
    response_model=RickAndMortyCharacterResponse | List[RickAndMortyCharacterResponse],
    status_code=status.HTTP_200_OK,
    summary="Get Rick and Morty Characters",
)
async def get_characters(
    request: RickAndMortyCharacterRequest = Depends(),
    rick_and_morty_service: RickAndMortyService = Depends(
        get_rick_and_morty_service),
):
    try:
        return await rick_and_morty_service.get_characters(request)
    except RickAndMortyAPIError as e:
        if e.status_code == 404:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Character not found",
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Rick and Morty API error",
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=("Internal Server Error while fetching Rick and Morty characters"),
        )


@router.get(
    "/location",
    response_model=RickAndMortyLocationResponse | List[RickAndMortyLocationResponse],
    status_code=status.HTTP_200_OK,
    summary="Get Rick and Morty Locations",
)
async def get_locations(
    request: RickAndMortyLocationRequest = Depends(),
    rick_and_morty_service: RickAndMortyService = Depends(
        get_rick_and_morty_service),
):
    try:
        return await rick_and_morty_service.get_locations(request)
    except RickAndMortyAPIError as e:
        if e.status_code == 404:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Location not found",
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Rick and Morty API error",
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=("Internal Server Error while fetching Rick and Morty locations"),
        )


@router.get(
    "/episode",
    response_model=RickAndMortyEpisodeResponse | List[RickAndMortyEpisodeResponse],
    status_code=status.HTTP_200_OK,
    summary="Get Rick and Morty Episodes",
)
async def get_episodes(
    request: RickAndMortyEpisodeRequest = Depends(),
    rick_and_morty_service: RickAndMortyService = Depends(
        get_rick_and_morty_service),
):
    try:
        return await rick_and_morty_service.get_episodes(request)
    except RickAndMortyAPIError as e:
        if e.status_code == 404:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Episode not found",
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Rick and Morty API error",
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=("Internal Server Error while fetching Rick and Morty episodes"),
        )
