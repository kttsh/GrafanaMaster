import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, 
  ChevronRight, 
  Pencil, 
  Trash2, 
  Search, 
  User
} from "lucide-react";
import { formatDate, getStatusColor, getInitials, cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface UserTableProps {
  onEditUser?: (userId: number) => void;
  onDeleteUser?: (userId: number) => void;
}

export default function UserTable({
  onEditUser,
  onDeleteUser,
}: UserTableProps) {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(5);
  const [search, setSearch] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  
  // Debounce search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setTimeout(() => {
      setSearchDebounced(e.target.value);
      setPage(1); // Reset to first page on new search
    }, 300);
  };
  
  // Fetch users with pagination and search
  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/combined-users", page, pageSize, searchDebounced],
    queryFn: async () => {
      const offset = (page - 1) * pageSize;
      const searchParam = searchDebounced ? `&search=${encodeURIComponent(searchDebounced)}` : "";
      const res = await fetch(`/api/combined-users?limit=${pageSize}&offset=${offset}${searchParam}`);
      if (!res.ok) throw new Error("Failed to fetch users");
      return res.json();
    },
  });
  
  const users = data?.users || [];
  const totalUsers = data?.total || 0;
  const totalPages = Math.ceil(totalUsers / pageSize);
  
  const goToPage = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  return (
    <div className="bg-grafana-dark-100 border border-grafana-dark-200 rounded-md overflow-hidden">
      <div className="p-4 border-b border-grafana-dark-200">
        <div className="relative">
          <Input 
            placeholder="Search users..."
            value={search}
            onChange={handleSearchChange}
            className="w-full md:w-64 pl-10 pr-3 py-2 bg-grafana-dark border border-grafana-dark-200 rounded-md text-grafana-text placeholder-grafana-gray focus:outline-none focus:ring-1 focus:ring-grafana-orange"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-grafana-gray" />
        </div>
      </div>
      
      <div className="overflow-x-auto grafana-scrollbar">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-grafana-dark-200">
              <TableHead className="px-4 py-3 text-grafana-text font-medium text-sm">User</TableHead>
              <TableHead className="px-4 py-3 text-grafana-text font-medium text-sm">Email</TableHead>
              <TableHead className="px-4 py-3 text-grafana-text font-medium text-sm">Organizations</TableHead>
              <TableHead className="px-4 py-3 text-grafana-text font-medium text-sm">Department</TableHead>
              <TableHead className="px-4 py-3 text-grafana-text font-medium text-sm">Last Login</TableHead>
              <TableHead className="px-4 py-3 text-grafana-text font-medium text-sm">Status</TableHead>
              <TableHead className="px-4 py-3 text-grafana-text font-medium text-sm">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="flex justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-grafana-orange" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-grafana-text">Loading users...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-grafana-error">
                  Error loading users: {error.message}
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-grafana-text">
                  No users found
                  {searchDebounced && ` matching "${searchDebounced}"`}
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => {
                const statusColors = getStatusColor(user.status);
                return (
                  <TableRow 
                    key={user.id} 
                    className="border-b border-grafana-dark-200 hover:bg-grafana-dark-200/50 transition-colors"
                  >
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-grafana-dark-200 flex items-center justify-center text-white mr-2">
                          <span>{getInitials(user.name)}</span>
                        </div>
                        <div>
                          <p className="text-white font-medium">{user.name}</p>
                          <p className="text-xs text-grafana-text">{user.userId}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-grafana-text">{user.email}</TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {/* Display user organizations as badges */}
                        {user.organizations?.length > 0 ? (
                          user.organizations.map((org, idx) => (
                            <span 
                              key={idx} 
                              className="px-2 py-1 rounded-full text-xs bg-blue-500/20 text-blue-300"
                            >
                              {org.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-grafana-text">-</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-grafana-text">
                      {user.department || '-'}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-grafana-text">
                      {formatDate(user.lastLogin)}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <span className={cn(
                        "inline-flex items-center px-2 py-1 rounded-full text-xs",
                        statusColors.bg,
                        statusColors.text
                      )}>
                        <span className={cn("h-1.5 w-1.5 rounded-full mr-1", statusColors.dot)}></span>
                        {user.status === 'active' ? 'Active' : 
                         user.status === 'pending' ? 'Pending' : 
                         user.status === 'disabled' ? 'Disabled' : user.status}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEditUser?.(user.id)}
                          className="text-grafana-text hover:text-white transition-colors"
                          title="Edit User"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDeleteUser?.(user.id)}
                          className="text-grafana-text hover:text-grafana-error transition-colors"
                          title="Delete User"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
      
      {!isLoading && totalUsers > 0 && (
        <div className="px-4 py-3 border-t border-grafana-dark-200 flex justify-between items-center flex-col md:flex-row space-y-3 md:space-y-0">
          <div className="text-sm text-grafana-text">
            Showing <span className="font-medium text-white">{(page - 1) * pageSize + 1}-{Math.min(page * pageSize, totalUsers)}</span> of <span className="font-medium text-white">{totalUsers}</span> users
          </div>
          
          <div className="flex space-x-1">
            <Button
              variant="outline"
              className="px-3 py-1 text-grafana-text bg-grafana-dark-200 hover:bg-grafana-dark disabled:opacity-50 disabled:cursor-not-allowed border-grafana-dark-200"
              onClick={() => goToPage(page - 1)}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="ml-1">Previous</span>
            </Button>
            
            {/* Simplified pagination - just show current page */}
            <Button
              variant="outline"
              className="px-3 py-1 text-white bg-grafana-orange border-grafana-orange"
            >
              {page}
            </Button>
            
            <Button
              variant="outline"
              className="px-3 py-1 text-grafana-text bg-grafana-dark-200 hover:bg-grafana-dark border-grafana-dark-200"
              onClick={() => goToPage(page + 1)}
              disabled={page === totalPages}
            >
              <span className="mr-1">Next</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
