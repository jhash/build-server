export const OPTIONS = 'options'
export const DELETE = 'delete'
export const INDEX = 'index'
export const PATCH = 'patch'
export const POST = 'post'
export const GET = 'get'
export const PUT = 'put'

export const REQUEST_MAP = {
  [OPTIONS.toUpperCase()]: OPTIONS,
  [GET.toUpperCase()]: INDEX,
  [POST.toUpperCase()]: POST
}

export const REQUEST_MAP_WITH_ID = {
  [DELETE.toUpperCase()]: DELETE,
  [PATCH.toUpperCase()]: PATCH,
  [GET.toUpperCase()]: GET,
  [PUT.toUpperCase()]: PUT
}
