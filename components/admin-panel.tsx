"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function AdminPanel() {
  const [users, setUsers] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users`)
      const data = await res.json()
      setUsers(data.users || [])
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }

  const deleteUser = async (userId: string) => {
    if (!confirm(`Delete user ${userId}?`)) return
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/delete?user_id=${userId}`, {
        method: "DELETE",
      })
      setUsers((prev) => prev.filter((u) => u !== userId))
    } catch (error) {
      console.error("Error deleting user:", error)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  return (
    <Card className="p-6 bg-card border border-border">
      <h2 className="text-2xl font-bold mb-4 text-foreground">Admin Panel</h2>
      <Button onClick={fetchUsers} disabled={loading} className="mb-4">
        {loading ? "Refreshing..." : "Refresh Users"}
      </Button>
      {users.length > 0 ? (
        <ul className="space-y-2">
          {users.map((user) => (
            <li
              key={user}
              className="flex justify-between items-center bg-muted/30 p-2 rounded-md"
            >
              <span className="text-foreground">{user}</span>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => deleteUser(user)}
              >
                Delete
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">No users found.</p>
      )}
    </Card>
  )
}
