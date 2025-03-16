import React, { useEffect, useState } from "react";
import StatusBadges from "./StatusBadge";
import QRCodeGenerator from "./QrcodeGen";
import CloseButton from "./CloseButton";
import QrCodeIcon from "@mui/icons-material/QrCode";
import StatusUi from "./StatusIcon";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  CircularProgress,
  Card,
  Box,
  Dialog,
  DialogTitle,
  Typography,
  Icon,
} from "@mui/material";
import Swal from "sweetalert2";
import {
  postRequest,
  getRequest,
  deleteRequest,
} from "../../utils/requestUtil";

const TransactionsTable = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qrLoading, setQrLoading] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [QrModalOpen, SetQrModalOpen] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await getRequest("/transaction/showlogs");
      setTransactions(response.data);
    } catch (error) {
      Swal.fire("Error!", "Unable to fetch transactions.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (transactionId, newStatus) => {
    try {
      await postRequest(`/transaction/${transactionId}`, { status: newStatus });
      fetchTransactions();
    } catch (error) {
      Swal.fire("Error!", "Unable to update status.", "error");
    }
  };

  const deleteTransaction = async (transactionId) => {
    Swal.fire({
      title: "Are you sure?",
      text: ` You will not be able to recover the transaction with ID ${transactionId}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await deleteRequest(`/transaction/${transactionId}`);
          console.log("Response:", response);

          if (response.success) {
            Swal.fire(response.message, "", "success");
            fetchTransactions();
          }
        } catch (error) {
          console.error("Error deleting transaction", error);
          Swal.fire(
            "Failed!",
            "The transaction could not be deleted.",
            "error"
          );
        }
      }
    });
  };

  return (
    <>
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Transaction Ref.</TableCell>
              <TableCell>Payee</TableCell>
              <TableCell>Bank</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
              <TableCell>QR Code</TableCell>
            </TableRow>
          </TableHead>
          <TableBody
            sx={{
              textAlign: "center",
              width: "50%",
              maxHeight: "400px", // จำกัดความสูงของ TableBody
              overflowY: "auto", // ทำให้สามารถ scroll แนวตั้งได้
            }}
          >
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : transactions.length > 0 ? (
              transactions.map((transaction) => (
                <TableRow key={transaction.transaction_id}>
                  <TableCell>{transaction.transaction_id}</TableCell>
                  <TableCell>{transaction.user_name}</TableCell>
                  <TableCell>{transaction.bank_id}</TableCell>
                  <TableCell>{transaction.amount}</TableCell>
                  <TableCell>
                    {new Date(transaction.timestamp).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {
                      <StatusBadges
                        status_id={transaction.transaction_id}
                        currentStatus={transaction.status}
                        fetchTransactions={fetchTransactions}
                      />
                    }
                  </TableCell>
                  <TableCell>
                    {
                      <Button
                        variant="contained"
                        color="error"
                        onClick={() =>
                          deleteTransaction(transaction.transaction_id)
                        }
                        sx={{ borderRadius: "15px" }}
                      >
                        Delete
                      </Button>
                    }
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => {
                        setSelectedTransaction(transaction);
                        SetQrModalOpen(true);
                      }}
                    >
                      <QrCodeIcon />
                    </Button>

                    <Dialog
                      open={QrModalOpen}
                      onClose={() => SetQrModalOpen(false)}
                      fullWidth
                      maxWidth="xs"
                      sx={{
                        "& .MuiDialog-paper": {
                          borderRadius: "12px",
                          padding: "20px",
                          boxShadow: "none",
                        },
                        "& .MuiBackdrop-root": {
                          backgroundColor: "rgba(0, 0, 0, 0.1)",
                        },
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <StatusUi
                          status={selectedTransaction?.status || "default"}
                        />
                        <CloseButton onClose={() => SetQrModalOpen(false)} />
                      </Box>
                      <DialogTitle
                        sx={{
                          display: "flex",
                          flexDirection: "row",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <Typography variant="h6" gutterBottom sx={{ ml: 2 }}>
                          QR Code{" "}
                          {selectedTransaction
                            ? selectedTransaction.transaction_id
                            : ""}
                        </Typography>
                      </DialogTitle>

                      <Box sx={{ fontSize: "10px" }}>
                        <Typography gutterBottom sx={{ ml: 2 }}>
                          Amount:{" "}
                          {selectedTransaction
                            ? selectedTransaction.amount
                            : "-"}{" "}
                          THB
                        </Typography>
                        <Typography gutterBottom sx={{ ml: 2 }}>
                          Bank id:{" "}
                          {selectedTransaction
                            ? selectedTransaction.bank_id
                            : "-"}
                        </Typography>
                        <Typography gutterBottom sx={{ ml: 2 }}>
                          Time:{" "}
                          {selectedTransaction
                            ? new Date(
                                selectedTransaction.timestamp
                              ).toLocaleDateString()
                            : "-"}
                        </Typography>
                      </Box>

                      <Box
                        sx={{ p: 3, display: "flex", justifyContent: "center" }}
                      >
                        <Box
                          sx={{
                            width: "100%",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <div sx={{ textAlign: "center" }}>
                            {qrLoading ? (
                              <CircularProgress
                                sx={{ display: "block", mx: "auto" }}
                              />
                            ) : (
                              selectedTransaction && (
                                <QRCodeGenerator
                                  bankId={selectedTransaction.bank_id}
                                  amount={selectedTransaction.amount}
                                  setQrLoading={setQrLoading}
                                />
                              )
                            )}
                          </div>
                        </Box>
                      </Box>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No transactions available.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default TransactionsTable;
