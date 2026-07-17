import { useQuery, useQueryClient } from '@tanstack/react-query'

export function useClassementCache() {
  const queryClient = useQueryClient()

  const { data: classement, isLoading, error } = useQuery({
    queryKey: ['classement'],
    queryFn: async () => {
      const res = await fetch('/api/classement')
      if (!res.ok) throw new Error('Failed to fetch classement')
      return res.json()
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  })

  const invalidateClassement = () => {
    queryClient.invalidateQueries({ queryKey: ['classement'] })
  }

  return { classement, isLoading, error, invalidateClassement }
}

export function useEquipesCache() {
  const { data: equipes, isLoading, error } = useQuery({
    queryKey: ['equipes'],
    queryFn: async () => {
      const res = await fetch('/api/equipes')
      if (!res.ok) throw new Error('Failed to fetch equipes')
      return res.json()
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 20 * 60 * 1000,
  })

  return { equipes, isLoading, error }
}

export function useUserProfile(userId: string) {
  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      const res = await fetch(`/api/profiles/${userId}`)
      if (!res.ok) throw new Error('Failed to fetch profile')
      return res.json()
    },
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 10 * 60 * 1000,
    enabled: !!userId,
  })

  return { profile, isLoading, error }
}
