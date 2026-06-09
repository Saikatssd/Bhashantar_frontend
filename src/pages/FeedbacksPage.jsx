import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Chip,
  Box,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  TablePagination,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Button,
} from "@mui/material";
import {
  RateReview as RateReviewIcon,
  Search as SearchIcon,
  Star as StarIcon,
  ThumbUp as ThumbUpIcon,
  SentimentNeutral as NeutralIcon,
  SentimentVeryDissatisfied as SadIcon,
  Assignment as DocIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Close as CloseIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../utils/firebase";
import { fetchFeedbacks, updateFeedbackStatus } from "../services/trackFileServices";
import { useInstance } from "../context/InstanceContext";
import Loader from "../components/common/Loader";
import { toast } from "react-hot-toast";

const FeedbacksPage = ({ companyId }) => {
  const { isKyroInstance, kyroId } = useInstance();
  const [feedbacks, setFeedbacks] = useState([]);
  const [users, setUsers] = useState({});
  const [companies, setCompanies] = useState({});
  const isKyrotics = isKyroInstance || (companyId && kyroId && companyId === kyroId);
  const [loading, setLoading] = useState(true);
  
  const [selectedNote, setSelectedNote] = useState("");
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  
  // Filtering & Pagination state
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch feedbacks
        const feedbacksData = await fetchFeedbacks(companyId);
        setFeedbacks(feedbacksData);

        // Extract unique IDs
        const uniqueUserIds = [...new Set(feedbacksData.map(f => f.userId).filter(Boolean))];
        const uniqueCompanyIds = [...new Set(feedbacksData.map(f => f.companyId).filter(Boolean))];

        // Fetch specific users
        const usersMap = {};
        await Promise.all(
          uniqueUserIds.map(async (uid) => {
            try {
              const userSnap = await getDoc(doc(db, "users", uid));
              if (userSnap.exists()) {
                usersMap[uid] = userSnap.data().name || userSnap.data().email || "Unknown User";
              }
            } catch (err) {
              console.warn(`Failed to fetch user ${uid}`, err);
            }
          })
        );
        setUsers(usersMap);

        // Fetch specific companies
        const companiesMap = {};
        await Promise.all(
          uniqueCompanyIds.map(async (cid) => {
            try {
              const compSnap = await getDoc(doc(db, "companies", cid));
              if (compSnap.exists()) {
                companiesMap[cid] = compSnap.data().name || "Unknown Company";
              }
            } catch (err) {
              console.warn(`Failed to fetch company ${cid}`, err);
            }
          })
        );
        setCompanies(companiesMap);
      } catch (err) {
        console.error("Error loading feedback details:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [companyId]);

  const handleStatusChange = async (feedbackId, newStatus) => {
    try {
      await updateFeedbackStatus(feedbackId, newStatus);
      setFeedbacks((prev) =>
        prev.map((f) => (f.id === feedbackId ? { ...f, status: newStatus } : f))
      );
      toast.success("Feedback status updated successfully!");
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error("Failed to update status.");
    }
  };

  if (loading) {
    return <Loader />;
  }

  // Calculate statistics
  const totalCount = feedbacks.length;
  const outstandingCount = feedbacks.filter((f) => f.qualityRating === "outstanding").length;
  const goodCount = feedbacks.filter((f) => f.qualityRating === "good").length;
  const averageCount = feedbacks.filter((f) => f.qualityRating === "average").length;
  const poorCount = feedbacks.filter((f) => f.qualityRating === "poor").length;

  // Filtered feedbacks
  const filteredFeedbacks = feedbacks.filter((f) => {
    const matchesSearch = (f.fileName || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRating = ratingFilter === "all" || f.qualityRating === ratingFilter;
    return matchesSearch && matchesRating;
  });

  // Paginated feedbacks
  const paginatedFeedbacks = filteredFeedbacks.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getRatingChip = (rating) => {
    switch (rating) {
      case "outstanding":
        return <Chip icon={<StarIcon style={{ color: "#2e7d32" }} />} label="Outstanding" size="small" sx={{ backgroundColor: "#e8f5e9", color: "#2e7d32", fontWeight: "bold" }} />;
      case "good":
        return <Chip icon={<ThumbUpIcon style={{ color: "#1565c0" }} />} label="Good" size="small" sx={{ backgroundColor: "#e3f2fd", color: "#1565c0", fontWeight: "bold" }} />;
      case "average":
        return <Chip icon={<NeutralIcon style={{ color: "#e65100" }} />} label="Average" size="small" sx={{ backgroundColor: "#fff3e0", color: "#e65100", fontWeight: "bold" }} />;
      case "poor":
        return <Chip icon={<SadIcon style={{ color: "#c62828" }} />} label="Poor" size="small" sx={{ backgroundColor: "#ffebee", color: "#c62828", fontWeight: "bold" }} />;
      default:
        return <Chip label={rating} size="small" />;
    }
  };

  const getStatusStyle = (status) => {
    const cleanStatus = (status || "pending").toLowerCase();
    switch (cleanStatus) {
      case "pending":
        return {
          text: "#b78103",
          bg: "#fffbeb",
          border: "#fde68a",
          borderHover: "#fcd34d",
        };
      case "resolved":
        return {
          text: "#047857",
          bg: "#ecfdf5",
          border: "#a7f3d0",
          borderHover: "#6ee7b7",
        };
      case "under_review":
      default:
        return {
          text: "#1d4ed8",
          bg: "#eff6ff",
          border: "#bfdbfe",
          borderHover: "#93c5fd",
        };
    }
  };

  return (
    <div className="h-screen overflow-y-auto mx-auto px-6 py-8 max-w-7xl">
      <div className=" rounded-xl  overflow-hidden mb-6">
        <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center">
            <Typography variant="h4" className="text-xl font-bold text-purple-800">
              Quality Reviews & Feedbacks
            </Typography>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-6  backdrop-blur-sm border-b border-purple-100">
          <Card elevation={0} sx={{ border: "1px solid #e1bee7", borderRadius: "12px", background: "#f3e5f5" }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Typography variant="subtitle2" color="textSecondary" fontWeight="bold">Total Feedbacks</Typography>
              <Typography variant="h4" color="purple" fontWeight="bold" mt={1}>{totalCount}</Typography>
            </CardContent>
          </Card>
          <Card elevation={0} sx={{ border: "1px solid #c8e6c9", borderRadius: "12px", background: "#e8f5e9" }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Typography variant="subtitle2" sx={{ color: "#2e7d32" }} fontWeight="bold">Outstanding 🌟</Typography>
              <Typography variant="h4" sx={{ color: "#2e7d32" }} fontWeight="bold" mt={1}>{outstandingCount}</Typography>
            </CardContent>
          </Card>
          <Card elevation={0} sx={{ border: "1px solid #bbdefb", borderRadius: "12px", background: "#e3f2fd" }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Typography variant="subtitle2" sx={{ color: "#1565c0" }} fontWeight="bold">Good 👍</Typography>
              <Typography variant="h4" sx={{ color: "#1565c0" }} fontWeight="bold" mt={1}>{goodCount}</Typography>
            </CardContent>
          </Card>
          <Card elevation={0} sx={{ border: "1px solid #ffe0b2", borderRadius: "12px", background: "#fff3e0" }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Typography variant="subtitle2" sx={{ color: "#e65100" }} fontWeight="bold">Average 😐</Typography>
              <Typography variant="h4" sx={{ color: "#e65100" }} fontWeight="bold" mt={1}>{averageCount}</Typography>
            </CardContent>
          </Card>
          <Card elevation={0} sx={{ border: "1px solid #ffcdd2", borderRadius: "12px", background: "#ffebee" }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Typography variant="subtitle2" sx={{ color: "#c62828" }} fontWeight="bold">Poor 😞</Typography>
              <Typography variant="h4" sx={{ color: "#c62828" }} fontWeight="bold" mt={1}>{poorCount}</Typography>
            </CardContent>
          </Card>
        </div>

        {/* Filters Section */}
        <div className="p-6  flex flex-col md:flex-row gap-4 items-center border-b border-purple-100">
          <Box flexGrow={1} width="100%">
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              placeholder="Search by document name..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(0);
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "#9c27b0" }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '20px',
                }
              }}
            />
          </Box>
          <FormControl size="small" sx={{ minWidth: 200, width: { xs: "100%", md: "auto" } }}>
            <InputLabel id="rating-filter-label">Filter by Rating</InputLabel>
            <Select
              labelId="rating-filter-label"
              id="rating-filter"
              value={ratingFilter}
              label="Filter by Rating"
              onChange={(e) => {
                setRatingFilter(e.target.value);
                setPage(0);
              }}
              sx={{ borderRadius: "20px" }}
            >
              <MenuItem value="all">All Ratings</MenuItem>
              <MenuItem value="outstanding">Outstanding</MenuItem>
              <MenuItem value="good">Good</MenuItem>
              <MenuItem value="average">Average</MenuItem>
              <MenuItem value="poor">Poor</MenuItem>
            </Select>
          </FormControl>
        </div>

        {/* Table Section */}
        <TableContainer component={Paper} elevation={0} className="bg-transparent">
          <Table className="min-w-full">
            <TableHead>
              <TableRow className="bg-purple-100/50">
                <TableCell className="px-6 py-4 font-semibold text-purple-800">
                  <div className="flex items-center"><DocIcon className="mr-2 text-purple-600" />Document Name</div>
                </TableCell>
                <TableCell className="px-6 py-4 font-semibold text-purple-800">
                  <div className="flex items-center"><PersonIcon className="mr-2 text-purple-600" />Submitter</div>
                </TableCell>
                {isKyrotics && (
                  <TableCell className="px-6 py-4 font-semibold text-purple-800">
                    <div className="flex items-center"><BusinessIcon className="mr-2 text-purple-600" />Company</div>
                  </TableCell>
                )}
                <TableCell className="px-6 py-4 font-semibold text-purple-800">Rating</TableCell>
                <TableCell className="px-6 py-4 font-semibold text-purple-800">Reason</TableCell>
                <TableCell className="px-6 py-4 font-semibold text-purple-800">Notes</TableCell>
                {isKyrotics && (
                  <TableCell className="px-6 py-4 font-semibold text-purple-800">Status</TableCell>
                )}
                <TableCell className="px-6 py-4 font-semibold text-purple-800">Date Submitted</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedFeedbacks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isKyrotics ? 8 : 6} align="center" className="py-8 text-gray-500 font-medium">
                    No feedbacks found matching search and filters.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedFeedbacks.map((f) => (
                  <TableRow
                    key={f.id}
                    className="border-b border-purple-50 hover:bg-purple-50/30 transition duration-150 ease-in-out"
                  >
                    <TableCell className="px-6 py-4 font-medium text-gray-900">{f.fileName}</TableCell>
                    <TableCell className="px-6 py-4 text-gray-700">{users[f.userId] || f.userId}</TableCell>
                    {isKyrotics && (
                      <TableCell className="px-6 py-4 text-gray-700">{companies[f.companyId] || f.companyId}</TableCell>
                    )}
                    <TableCell className="px-6 py-4">{getRatingChip(f.qualityRating)}</TableCell>
                    <TableCell className="px-6 py-4 text-gray-600 italic">
                      {f.reason ? (
                        <Box sx={{
                          background: "#fafafa",
                          p: 1,
                          borderRadius: "8px",
                          borderLeft: "3px solid #ff9800",
                          maxWidth: "250px",
                          wordBreak: "break-word",
                          fontSize: "13px"
                        }}>
                          "{f.reason}"
                        </Box>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      {f.notes ? (
                        <Button 
                          variant="outlined" 
                          size="small" 
                          startIcon={<VisibilityIcon />}
                          onClick={() => {
                            setSelectedNote(f.notes);
                            setIsNoteModalOpen(true);
                          }}
                          sx={{ borderRadius: '16px', textTransform: 'none', width: 'fit-content' }}
                        >
                          View Notes
                        </Button>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </TableCell>
                    {isKyrotics && (
                      <TableCell className="px-6 py-4">
                        {(() => {
                          const style = getStatusStyle(f.status);
                          return (
                            <Select
                              value={f.status || "pending"}
                              onChange={(e) => handleStatusChange(f.id, e.target.value)}
                              size="small"
                              sx={{
                                borderRadius: "20px",
                                fontSize: "12px",
                                fontWeight: "bold",
                                height: "28px",
                                backgroundColor: style.bg,
                                color: style.text,
                                transition: "all 0.2s ease-in-out",
                                "& .MuiSelect-select": {
                                  py: "4px",
                                  pl: "10px",
                                  pr: "24px",
                                  display: "flex",
                                  alignItems: "center",
                                },
                                "& .MuiSelect-icon": {
                                  color: style.text,
                                  transition: "color 0.2s",
                                },
                                "& .MuiOutlinedInput-notchedOutline": {
                                  borderColor: style.border,
                                },
                                "&:hover .MuiOutlinedInput-notchedOutline": {
                                  borderColor: style.borderHover,
                                },
                                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                  borderColor: style.text,
                                  borderWidth: "1.5px",
                                },
                                "&:hover": {
                                  transform: "translateY(-1px)",
                                  boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.05)",
                                },
                              }}
                            >
                              <MenuItem value="pending" sx={{ fontWeight: "bold", color: "#b78103", fontSize: "12px" }}>
                                Pending
                              </MenuItem>
                              <MenuItem value="under_review" sx={{ fontWeight: "bold", color: "#1d4ed8", fontSize: "12px" }}>
                                Under Review
                              </MenuItem>
                              <MenuItem value="resolved" sx={{ fontWeight: "bold", color: "#047857", fontSize: "12px" }}>
                                Resolved
                              </MenuItem>
                            </Select>
                          );
                        })()}
                      </TableCell>
                    )}
                    <TableCell className="px-6 py-4 text-gray-500 text-sm">
                      {f.submittedAt ? new Date(f.submittedAt).toLocaleString() : "N/A"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredFeedbacks.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          className="border-t border-purple-100 bg-white"
        />
      </div>

      {/* Notes Modal */}
      <Dialog 
        open={isNoteModalOpen} 
        onClose={() => setIsNoteModalOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: { borderRadius: "16px", padding: "8px" }
        }}
      >
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontWeight: "bold", pb: 1 }}>
          Reviewer Notes
          <IconButton onClick={() => setIsNoteModalOpen(false)} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ py: 2, backgroundColor: "#fffdf0" }}>
          <Typography variant="body1" sx={{ whiteSpace: "pre-wrap", color: "#333", fontSize: "15px", lineHeight: "1.6" }}>
            {selectedNote}
          </Typography>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FeedbacksPage;
