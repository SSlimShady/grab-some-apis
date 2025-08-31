import logging
from datetime import datetime

from app.core.circuit_breaker import circuit_breaker
from app.core.config import settings
from app.schemas.rickandmorty import (
    RickAndMortyCharacter,
    RickAndMortyCharacterRequest,
    RickAndMortyCharacterResponse,
    RickAndMortyEpisodeRequest,
    RickAndMortyEpisodeResponse,
    RickAndMortyLocationRequest,
    RickAndMortyLocationResponse,
)
from app.services.base import APIError, BaseAPIService

logger = logging.getLogger(__name__)


class RickAndMortyAPIError(APIError):
    def __init__(self, status_code: int, message: str, response_data=None):
        super().__init__(status_code, message, response_data, "RickAndMorty")


class RickAndMortyService(BaseAPIService):
    def __init__(self):
        base_url = settings.RICK_AND_MORTY_BASE_URL
        super().__init__("RickAndMorty", base_url)

    async def health_check(self):
        try:
            response = await self._make_request("")
            return {
                "status": "healthy",
                "service": "Rick and Morty API",
                "timestamp": datetime.now().isoformat(),
                "data": response,
            }
        except APIError as e:
            return {
                "status": "unhealthy",
                "service": "Rick and Morty API",
                "timestamp": datetime.now().isoformat(),
                "error": f"API Error {e.status_code}: {e.message}",
            }
        except Exception as e:
            return {
                "status": "unhealthy",
                "service": "Rick and Morty API",
                "timestamp": datetime.now().isoformat(),
                "error": str(e),
            }

    @circuit_breaker(name="rick_and_morty", failure_threshold=5, timeout=30)
    async def get_characters(
        self, request: RickAndMortyCharacterRequest
    ) -> RickAndMortyCharacterResponse | list[RickAndMortyCharacterResponse]:
        try:
            logger.info(f"Fetching Rick and Morty characters with params: {request.model_dump(exclude_none=True)}")
            response = await self._make_request("character", params=request.model_dump(exclude_none=True))
            if isinstance(response, list):
                return [RickAndMortyCharacterResponse(**item) for item in response]
            else:
                return RickAndMortyCharacterResponse(**response)
        except APIError as e:
            raise RickAndMortyAPIError(e.status_code, e.message, e.response_data)
        except Exception as e:
            logger.error(f"Unexpected error occurred: {e}")
            raise RickAndMortyAPIError(500, "Internal Server Error")

    @circuit_breaker(name="rick_and_morty", failure_threshold=5, timeout=30)
    async def get_characters_by_ids(self, characters_id: str) -> RickAndMortyCharacter | list[RickAndMortyCharacter]:
        try:
            logger.info(f"Fetching Rick and Morty characters with IDs: {characters_id}")

            response = await self._make_request("character/{id}", path_params={"id": characters_id})
            if isinstance(response, list):
                return [RickAndMortyCharacter(**item) for item in response]
            else:
                return RickAndMortyCharacter(**response)
        except APIError as e:
            raise RickAndMortyAPIError(e.status_code, e.message, e.response_data)
        except Exception as e:
            logger.error(f"Unexpected error occurred: {e}")
            raise RickAndMortyAPIError(500, "Internal Server Error")

    @circuit_breaker(name="rick_and_morty", failure_threshold=5, timeout=30)
    async def get_locations(
        self, request: RickAndMortyLocationRequest
    ) -> RickAndMortyLocationResponse | list[RickAndMortyLocationResponse]:
        try:
            logger.info(f"Fetching Rick and Morty locations with params: {request.model_dump(exclude_none=True)}")
            response = await self._make_request("location", params=request.model_dump(exclude_none=True))
            if isinstance(response, list):
                return [RickAndMortyLocationResponse(**item) for item in response]
            else:
                return RickAndMortyLocationResponse(**response)
        except APIError as e:
            raise RickAndMortyAPIError(e.status_code, e.message, e.response_data)
        except Exception as e:
            logger.error(f"Unexpected error occurred: {e}")
            raise RickAndMortyAPIError(500, "Internal Server Error")

    @circuit_breaker(name="rick_and_morty", failure_threshold=5, timeout=30)
    async def get_episodes(
        self, request: RickAndMortyEpisodeRequest
    ) -> RickAndMortyEpisodeResponse | list[RickAndMortyEpisodeResponse]:
        try:
            logger.info(f"Fetching Rick and Morty episodes with params: {request.model_dump(exclude_none=True)}")
            response = await self._make_request("episode", params=request.model_dump(exclude_none=True))
            if isinstance(response, list):
                return [RickAndMortyEpisodeResponse(**item) for item in response]
            else:
                return RickAndMortyEpisodeResponse(**response)
        except APIError as e:
            raise RickAndMortyAPIError(e.status_code, e.message, e.response_data)
        except Exception as e:
            logger.error(f"Unexpected error occurred: {e}")
            raise RickAndMortyAPIError(500, "Internal Server Error")


def create_rick_and_morty_service():
    return RickAndMortyService()


def get_rick_and_morty_service():
    service = create_rick_and_morty_service()
    try:
        yield service
    finally:
        # Service cleanup is handled by the base service
        pass
